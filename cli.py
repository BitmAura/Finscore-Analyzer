import click
import json
import os
from pathlib import Path
from cookiecutter.main import cookiecutter


@click.group()
def cli():
    """FinScore Analyzer CLI - Command line tools for project management."""
    pass


@click.command()
@click.option(
    '--output-dir',
    default='.',
    help='The directory where the project will be created.'
)
@click.option(
    '--extra-context',
    default='{}',
    help='A JSON string with extra variables for the template.'
)
def new(output_dir, extra_context):
    """Creates a new project from a template."""
    try:
        context_dict = json.loads(extra_context)
        
        # Get the directory where this script is located
        script_dir = Path(__file__).parent.resolve()
        template_path = script_dir / 'templates' / 'project_template'
        
        cookiecutter(
            str(template_path),
            output_dir=output_dir,
            extra_context=context_dict,
            no_input=True  # Assumes context provides all needed vars, or defaults are ok
        )
        click.echo(f"Successfully created new project in {output_dir}")
    except json.JSONDecodeError:
        click.echo("Error: Invalid JSON string for --extra-context.", err=True)
        raise click.Abort()
    except Exception as e:
        click.echo(f"An error occurred: {e}", err=True)
        raise click.Abort()


# Add the 'new' command to the main CLI group
cli.add_command(new)


if __name__ == '__main__':
    cli()
