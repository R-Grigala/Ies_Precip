from flask import render_template, Blueprint
from os import path

from src.config import Config

TEMPLATES_FOLDER = path.join(Config.BASE_DIR, Config.TEMPLATES_FOLDERS, "stations")
stations_blueprint = Blueprint("stations", __name__, template_folder=TEMPLATES_FOLDER)

@stations_blueprint.route("/stations")
def stations():
    return render_template("stations.html")