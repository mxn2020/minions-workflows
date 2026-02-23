"""
Minions Workflows Python SDK

Workflow definitions, step sequences, transitions, and run history
"""

__version__ = "0.1.0"


def create_client(**kwargs):
    """Create a client for Minions Workflows.

    Args:
        **kwargs: Configuration options.

    Returns:
        dict: Client configuration.
    """
    return {
        "version": __version__,
        **kwargs,
    }

from .schemas import *
