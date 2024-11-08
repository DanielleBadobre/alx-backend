#!/usr/bin/env python3
""" 2-app """
from flask import Flask, request
from flask_babel import Babel


app = Flask(__name__)


class Config:
    """ class config """
    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"


app.config.from_object(Config)
babel = Babel(app)


@babel.localselector
def get_locale():
    """ get best match for supported language"""
    return request.accept_languages.best_match(app.config['LANGUAGES'])
