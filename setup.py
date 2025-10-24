from setuptools import setup, find_packages

setup(
    name='finscore-cli',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'click>=8.1.0',
        'cookiecutter>=2.1.0',
    ],
    entry_points={
        'console_scripts': [
            'finscore=cli:cli',
        ],
    },
)
