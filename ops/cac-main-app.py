#!/usr/bin/env python3
"""Server-installed CAC app-only deployment commands; no migrations or seeds."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit

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
    import time
    root = Path('/var/backups/bessma/staging')
    if root.exists():
        for item in root.iterdir():
            if item.is_dir() and not item.is_symlink() and (item / 'failure.txt').is_file() and time.time() - item.stat().st_mtime > 172800:
                raise RuntimeError('Shared backup cleanup requires separate review')
    return command, env


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
    else:
        call(['docker', 'image', 'inspect', f'cac-main-app:{sha}'], True)
    call(command + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', 'app'], env=env)
    print(f'CAC app-only {mode}: {sha}')


if __name__ == '__main__':
    main()
