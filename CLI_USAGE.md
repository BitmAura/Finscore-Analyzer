# FinScore Analyzer CLI Usage Guide

## Overview
The FinScore Analyzer CLI provides command-line tools for project management and scaffolding.

## Installation

### Prerequisites
- Python 3.7+
- pip

### Install Dependencies
```bash
pip install -r requirements.txt
```

Or install directly:
```bash
pip install click cookiecutter
```

## Commands

### `new` - Create New Project

Creates a new project from a template using cookiecutter.

#### Basic Usage
```bash
python cli.py new
```
This creates a project in the current directory with default settings.

#### Specify Output Directory
```bash
python cli.py new --output-dir ./my-new-project
```

#### Custom Template Variables
```bash
python cli.py new --output-dir ./my-project --extra-context '{"project_name": "Finance App", "author_name": "John Doe", "version": "1.0.0"}'
```

#### Available Template Variables
- `project_name`: Name of the project (default: "My New Project")
- `project_slug`: URL-safe project name (auto-generated from project_name)
- `description`: Project description (default: "A new FinScore project")
- `author_name`: Author name (default: "Your Name")
- `version`: Project version (default: "0.1.0")

## Examples

### Example 1: Simple Project
```bash
python cli.py new --output-dir ./simple-app
```
Creates a project named "my_new_project" in `./simple-app/`.

### Example 2: Custom Project
```bash
python cli.py new \
  --output-dir ./finance-dashboard \
  --extra-context '{"project_name": "Finance Dashboard", "author_name": "FinScore Team", "description": "A comprehensive finance dashboard", "version": "2.0.0"}'
```
Creates a customized project named "finance_dashboard" in `./finance-dashboard/`.

### Example 3: Quick Start Script
```bash
# Create a new project and initialize it
python cli.py new --output-dir ./my-app \
  --extra-context '{"project_name": "My App", "author_name": "Your Name"}'

cd my-app/my_app
npm install
npm run dev
```

## Error Handling

The CLI provides clear error messages:

### Invalid JSON
```bash
$ python cli.py new --extra-context 'invalid json'
Error: Invalid JSON string for --extra-context.
Aborted!
```

### Missing Template
If the template directory is missing, you'll see:
```bash
An error occurred: A valid repository for "templates/project_template" could not be found...
Aborted!
```

## Testing

Run the test suite:
```bash
python -m unittest test_cli.py -v
```

## Help

Get help for any command:
```bash
# General help
python cli.py --help

# Help for 'new' command
python cli.py new --help
```

## Exit Codes

- `0`: Success
- `1`: Error (invalid JSON, template not found, etc.)

## Installation as System Command

To install the CLI as a system command:
```bash
pip install -e .
```

Then use it directly:
```bash
finscore new --output-dir ./my-project
```
