#!/usr/bin/env python3
"""Server-installed CAC app-only deployment commands; no migrations or seeds."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit
from urllib.request import urlopen
import time

LIVE = Path('/home/bouye/apps/cac-main')
PROJECT = 'cac-main'
REPOSITORY = 'Hamoud-md/CAC'


def call(args, capture=False, env=None):
    result = subprocess.run(args, cwd=LIVE, env=env, text=True,
                            stdout=subprocess.PIPE if capture else None,
                            stderr=subprocess.PIPE if capture else None, check=False)
    if result.returncode:
        # Captured Compose output can contain secrets; never forward it.
        raise RuntimeError(f'{args[0]} failed (exit {result.returncode})')
    return result.stdout if capture else None


def preflight(sha):
    if LIVE.is_symlink() or LIVE.resolve() != LIVE:
        raise RuntimeError('Unexpected CAC directory')
    env = dict(os.environ, CAC_RELEASE_SHA=sha, COMPOSE_PARALLEL_LIMIT='1')
    command = ['docker', 'compose', '--project-name', PROJECT, '--env-file',
               '.env.production', '-f', 'docker-compose.live.yml']
    config = json.loads(call(command + ['config', '--format', 'json'], True, env))
    app = config['services']['app']
    url = urlsplit(app['environment']['DATABASE_URL'])
    if (url.hostname, url.path, url.username) != ('db', '/cacmain', 'cacmain'):
        raise RuntimeError('CAC database identity mismatch')
    if app['environment'].get('NODE_ENV') != 'production':
        raise RuntimeError('Production mode is required')
    if app['environment'].get('NEXT_PUBLIC_SERVER_URL') != 'https://cac.yasserai.net':
        raise RuntimeError('CAC URL mismatch')
    if app.get('container_name') != 'cac-main-app' or app['image'] != f'cac-main-app:{sha}':
        raise RuntimeError('CAC application identity mismatch')
    mounts = app.get('volumes', [])
    if len(mounts) != 1 or mounts[0]['type'] != 'volume' or mounts[0]['target'] != '/app/public/media':
        raise RuntimeError('Unexpected application mounts')
    volume = config['volumes'][mounts[0]['source']]['name']
    if volume != 'cac-main_cac_main_media':
        raise RuntimeError('CAC media volume mismatch')
    for name in ['cac-main_cac_main_db_data', 'cac-main_cac_main_media']:
        call(['docker', 'volume', 'inspect', name], True)
    if set(app.get('networks', {})) != {'default', 'traefik-public'}:
        raise RuntimeError('Unexpected CAC application networks')
    for name in ['cac-main_default', 'traefik-public']:
        call(['docker', 'network', 'inspect', name], True)
    ports = app.get('ports', [])
    if len(ports) != 1 or (ports[0].get('host_ip'), str(ports[0].get('published')), ports[0].get('target')) != ('127.0.0.1', '3200', 3000):
        raise RuntimeError('Unexpected CAC port binding')
    # The shared backup program cleans expired failed staging directories. Refuse
    # this release if that could cause cleanup outside the CAC release scope.
    root = Path('/var/backups/bessma/staging')
    if root.exists():
        for item in root.iterdir():
            if item.is_dir() and not item.is_symlink() and (item / 'failure.txt').is_file() and time.time() - item.stat().st_mtime > 172800:
                raise RuntimeError('Shared backup cleanup requires separate review')
    return command, env


def preview(command, env, sha):
    config = json.loads(call(command + ['config', '--format', 'json'], True, env))
    values = config['services']['app']['environment']
    name = f'cac-main-preview-{sha[:12]}'
    path = LIVE / f'.preview-{sha[:12]}.env'
    created = False
    environment_created = False
    try:
        with open(path, 'x', opener=lambda p, flags: os.open(p, flags, 0o600)) as output:
            environment_created = True
            for key, value in values.items():
                if '\n' in str(value) or '\r' in str(value):
                    raise RuntimeError('Multiline preview environment is unsupported')
                output.write(f'{key}={value}\n')
        call(['docker', 'run', '-d', '--name', name, '--network', 'cac-main_default',
              '--label', 'traefik.enable=false', '--publish', '127.0.0.1:13200:3000',
              '--env-file', str(path), '--mount',
              'type=volume,source=cac-main_cac_main_media,target=/app/public/media,readonly',
              f'cac-main-app:{sha}'], True)
        created = True
        routes = ['/en', '/fr', '/ar', '/images/cac-logo-original.png', '/admin']
        for route in routes:
            for attempt in range(30):
                try:
                    with urlopen('http://127.0.0.1:13200' + route, timeout=10) as response:
                        body = response.read()
                        if response.status == 200 and body:
                            if route in {'/en', '/fr', '/ar'}:
                                for link in re.findall(r'href="(/(?:en|fr|ar)/projets/[^"?#]+)"', body.decode(errors='replace')):
                                    if link not in routes:
                                        routes.append(link)
                            break
                except Exception:
                    pass
                time.sleep(2)
            else:
                raise RuntimeError(f'CAC preview failed for {route}; live app not switched')
        print('CAC preview passed: FR/EN/AR, linked projects, original logo and admin; media mounted read-only')
    finally:
        if created:
            call(['docker', 'rm', '-f', name], True)
        if environment_created:
            path.unlink(missing_ok=True)


def wait_healthy(sha):
    for attempt in range(45):
        container = json.loads(call(['docker', 'inspect', 'cac-main-app'], True))[0]
        if container['Config']['Image'] != f'cac-main-app:{sha}':
            raise RuntimeError('Live CAC image does not match the release')
        state = container['State']
        if state.get('Health', {}).get('Status') == 'healthy':
            return
        if state['Status'] != 'running' or state.get('Health', {}).get('Status') == 'unhealthy':
            raise RuntimeError('Live CAC app is not healthy')
        time.sleep(2)
    raise RuntimeError('Live CAC health check timed out')


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in {'preflight', 'deploy', 'rollback'}:
        raise RuntimeError('Expected preflight, deploy or rollback')
    manifest = json.loads((Path.cwd() / '.bessma-release.json').read_text())
    sha = manifest.get('sha', '')
    if manifest.get('repository') != REPOSITORY or not re.fullmatch('[0-9a-f]{40}', sha):
        raise RuntimeError('Invalid CAC release identity')
    command, env = preflight(sha)
    mode = sys.argv[1]
    if mode == 'preflight':
        print('CAC target, storage and production environment verified')
        return
    if Path.cwd().resolve() != LIVE:
        raise RuntimeError('Unexpected deployment working directory')
    if mode == 'deploy':
        call(command + ['build', 'app'], env=env)
        preview(command, env, sha)
    else:
        call(['docker', 'image', 'inspect', f'cac-main-app:{sha}'], True)
    call(command + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', 'app'], env=env)
    wait_healthy(sha)
    print(f'CAC app-only {mode}: {sha}')


if __name__ == '__main__':
    main()
