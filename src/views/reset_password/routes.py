from flask import render_template, Blueprint, redirect, url_for
from os import path

from src.config import Config
from src.utils import url_serializer


TEMPLATES_FOLDER = path.join(Config.BASE_DIR, Config.TEMPLATES_FOLDERS, "resetPassword")
reset_password_blueprint = Blueprint("reset_password", __name__, template_folder=TEMPLATES_FOLDER)

@reset_password_blueprint.route("/reset_password/<token>")
def reset_password(token):
    uuid = url_serializer.unload_token(token=token,salt='reset_password', max_age_seconds=300)

    if uuid == 'invalid':
        return redirect(url_for('auth.login', message=uuid))
    elif uuid == 'expired':
        return redirect(url_for('auth.login', message=uuid))

    return render_template("resetPassword.html", token=token)