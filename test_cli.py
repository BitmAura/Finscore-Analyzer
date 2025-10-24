import unittest
import tempfile
import shutil
import json
import os
from pathlib import Path
from click.testing import CliRunner
from cli import cli


class TestNewCommand(unittest.TestCase):
    """Test suite for the 'new' CLI command."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.runner = CliRunner()
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up test fixtures."""
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_new_command_default_context(self):
        """Test creating a new project with default context."""
        result = self.runner.invoke(cli, ['new', '--output-dir', self.test_dir])
        
        self.assertEqual(result.exit_code, 0)
        self.assertIn('Successfully created new project', result.output)
        
        # Check if project directory was created
        project_dir = Path(self.test_dir) / 'my_new_project'
        self.assertTrue(project_dir.exists())
        
        # Check if expected files exist
        self.assertTrue((project_dir / 'README.md').exists())
        self.assertTrue((project_dir / 'package.json').exists())
    
    def test_new_command_custom_context(self):
        """Test creating a new project with custom context."""
        extra_context = json.dumps({
            'project_name': 'Test Project',
            'author_name': 'Test Author',
            'version': '2.0.0'
        })
        
        result = self.runner.invoke(
            cli, 
            ['new', '--output-dir', self.test_dir, '--extra-context', extra_context]
        )
        
        self.assertEqual(result.exit_code, 0)
        self.assertIn('Successfully created new project', result.output)
        
        # Check if project directory was created with custom name
        project_dir = Path(self.test_dir) / 'test_project'
        self.assertTrue(project_dir.exists())
        
        # Verify custom values in generated files
        readme_content = (project_dir / 'README.md').read_text()
        self.assertIn('Test Project', readme_content)
        self.assertIn('Test Author', readme_content)
        self.assertIn('2.0.0', readme_content)
    
    def test_new_command_invalid_json(self):
        """Test error handling with invalid JSON."""
        result = self.runner.invoke(
            cli,
            ['new', '--output-dir', self.test_dir, '--extra-context', 'invalid json']
        )
        
        self.assertEqual(result.exit_code, 0)  # CLI doesn't exit with error code
        self.assertIn('Invalid JSON string', result.output)
    
    def test_new_command_help(self):
        """Test the help message for 'new' command."""
        result = self.runner.invoke(cli, ['new', '--help'])
        
        self.assertEqual(result.exit_code, 0)
        self.assertIn('Creates a new project from a template', result.output)
        self.assertIn('--output-dir', result.output)
        self.assertIn('--extra-context', result.output)


if __name__ == '__main__':
    unittest.main()
