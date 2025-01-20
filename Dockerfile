FROM python:3.11.1-slim-buster

# სამუშაო დირექტორია
WORKDIR /app

# აპლიკაციის კოდის კოპირება
COPY . .

# მოთხოვნილებების ინსტალაცია
RUN pip install --upgrade pip
RUN apt-get update && apt-get -y install python3-dev gcc build-essential
RUN pip install -r requirements.txt

RUN chmod +x /app/flask_app.sh
RUN chmod +x /app/run_scheduler.sh

# 5000 პორტის გახსნა
EXPOSE 5000

CMD ["uwsgi", "uwsgi.ini"]