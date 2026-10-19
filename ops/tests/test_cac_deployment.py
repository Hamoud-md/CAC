import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch


class CandidatePreviewTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location(
            'cac_deployment', Path(__file__).parents[1] / 'cac-main-app.py'
        )
        self.deployment = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.deployment)
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.deployment.LIVE = Path(self.temporary.name)
        self.sha = 'a' * 40
        self.path = self.deployment.LIVE / f'.preview-{self.sha[:12]}.env'

    def test_preview_creates_private_environment_checks_routes_and_cleans_only_its_resources(self):
        calls = []

        def call(args, capture=False, env=None):
            calls.append(args)
            if 'config' in args:
                return json.dumps({'services': {'app': {'environment': {'NODE_ENV': 'production'}}}})
            if args[:2] == ['docker', 'run']:
                self.assertEqual(self.path.read_text(), 'NODE_ENV=production\n')
                self.assertIn('type=volume,source=cac-main_cac_main_media,target=/app/public/media,readonly', args)
            return ''

        response = MagicMock()
        response.__enter__.return_value.status = 200
        response.__enter__.return_value.read.return_value = b'healthy'
        with patch.object(self.deployment, 'call', side_effect=call), patch.object(
            self.deployment, 'urlopen', return_value=response
        ) as probe:
            self.deployment.preview(['docker', 'compose'], {}, self.sha)
        self.assertEqual(probe.call_count, 5)
        self.assertFalse(self.path.exists())
        self.assertEqual(calls[-1], ['docker', 'rm', '-f', f'cac-main-preview-{self.sha[:12]}'])
        self.assertFalse(any('up' in command for command in calls))

    def test_health_gate_waits_for_the_exact_live_image(self):
        def container(health):
            return json.dumps([{'Config': {'Image': f'cac-main-app:{self.sha}'},
                                'State': {'Status': 'running', 'Health': {'Status': health}}}])
        with patch.object(self.deployment, 'call', side_effect=[container('starting'), container('healthy')]), patch.object(self.deployment.time, 'sleep') as sleep:
            self.deployment.wait_healthy(self.sha)
        sleep.assert_called_once_with(2)
        with patch.object(self.deployment, 'call', return_value=container('healthy')):
            with self.assertRaisesRegex(RuntimeError, 'does not match'):
                self.deployment.wait_healthy('b' * 40)

    def test_existing_environment_file_is_preserved_when_exclusive_creation_fails(self):
        self.path.write_text('existing-file-must-survive')
        config = json.dumps({'services': {'app': {'environment': {}}}})
        with patch.object(self.deployment, 'call', return_value=config) as call:
            with self.assertRaises(FileExistsError):
                self.deployment.preview(['docker', 'compose'], {}, self.sha)
        self.assertEqual(self.path.read_text(), 'existing-file-must-survive')
        self.assertEqual(call.call_count, 1)


if __name__ == '__main__':
    unittest.main()
