# კონფიგურაცია და ოპერირება

## მოთხოვნები

- Python 3 (Dockerfile იყენებს `python:3.12-slim`-ს).
- MySQL 8 Docker განლაგებისთვის; აპის კონფიგურაციაში MySQL URI არის ჩართული.
- `requirements.txt`-ში ჩამოთვლილი Python ბიბლიოთეკები.
- გარე Weather.com PWS API-სა და SMTP სერვერზე ქსელური წვდომა შესაბამისი ფუნქციებისთვის.

## გარემოს კონფიგურაცია

`src/config.py` `.env`-ს მიმდინარე სამუშაო დირექტორიიდან კითხულობს. ძირითადი ცვლადებია:

| ცვლადი | დანიშნულება |
| --- | --- |
| `MY_SECRET_KEY` | Flask secret key და პაროლის აღდგენის token-ების ხელმოწერა. |
| `JWT_SECRET_KEY` | JWT ხელმოწერის გასაღები. |
| `MYSQL_HOST` | MySQL host. |
| `MYSQL_DATABASE` | ბაზის სახელი. |
| `MYSQL_USER`, `MYSQL_PASSWORD` | აპის DB ანგარიში. |
| `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP კავშირი პაროლის აღდგენისთვის. |

კოდში არის fallback მნიშვნელობები (`default_secret_key`, `default_jwt_secret_key` და DB/SMTP placeholder-ები). ისინი მხოლოდ დეველოპერული fallback-ებია და რეალურ გარემოში ყველა საჭირო მნიშვნელობა უნდა განისაზღვროს. პაროლის აღდგენის SMTP helper `starttls()`-ს იყენებს.

## ლოკალური ინსტალაცია

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

შექმენი DB და მომხმარებელი MySQL-ში, შემდეგ დაამატე `.env`. Flask-Migrate-ის მიგრაციის გაშვება:

```bash
export FLASK_APP=app.py
flask db upgrade
```

აპი გაუშვი:

```bash
python app.py
```

ეს პირდაპირი გაშვების გზა `debug=True`-ს რთავს და მხოლოდ ლოკალური განვითარებისათვისაა. `app.py`-ის module-level კოდი Flask CLI-სთვისაც აპის factory-ს ქმნის.

## საწყისი მონაცემები და მიგრაციები

- `flask db upgrade` არსებული Alembic მიგრაციებით ცხრილების სქემას განაახლებს.
- `flask populate_db` CSV-ებიდან სადგურებს, რუკის პოზიციებს, ამინდის ჩანაწერებსა და წინა დაგროვების მდგომარეობას ტვირთავს, შემდეგ კი როლებს და კოდში გაწერილ სამ ანგარიშს ქმნის.
- `flask insert_db` `div_positions` ჩანაწერების ნაწილს `map_selected=False`-ზე ცვლის.
- `flask init_db` იძახებს `db.drop_all()`-სა და `db.create_all()`-ს. ეს **დესტრუქციული** ბრძანებაა; არსებული მონაცემების ბაზაზე არ გაუშვა.

Seed ფაილების სახელები და გზები `src/commands.py`-შია მითითებული: `stations_2024-12-05.csv`, `weather_data_2024-06-26_2024-06-28.csv`, `station_div_positions.csv`, `prev_precip.csv`.

## Docker Compose

```bash
docker compose up --build
```

Compose-ის სერვისები:

- `flask` — Dockerfile აშენებს Python image-ს; uWSGI 4 პროცესსა და 8 thread-ს იყენებს.
- `nginx` — host-ის `2024` პორტს container-ის 80 პორტზე უკავშირებს და uWSGI upstream-ს მიმართავს.
- `db` — MySQL 8, host-ის `3307` პორტზე; მონაცემები `./database`-ში ინახება.

Docker Compose `.env`-დან Flask-ისა და MySQL-ის გარემოს ცვლადებს იღებს. ბაზის `depends_on` მხოლოდ გაშვების თანმიმდევრობას ადგენს და არ ნიშნავს, რომ MySQL უკვე მზადაა მოთხოვნების მისაღებად. საწყისი მიგრაციები/seed ავტომატურად არ სრულდება. `flask_app.sh` `init_db`-ს და `populate_db`-ს უშვებს, ამიტომ მისი გამოყენება მონაცემების წაშლას იწვევს.

## Scheduler-ის ამუშავება

`run_scheduler.sh` უშვებს `tools/scheduler.py`-ს. Scheduler დასაწყისში მომდევნო 5 წუთის ნიშნულამდე ელოდება და შემდეგ სამ განმეორებად ამოცანას იწყებს. Dockerfile-ის `CMD` scheduler-ს ფონურ პროცესად უშვებს, ხოლო uWSGI-ს მთავარ პროცესად ტოვებს.

Scheduler-ში `while True: pass` უსასრულო ციკლია, რომელიც პროცესორს მუდმივად ტვირთავს. Scheduler ცალკე Compose სერვისი არ არის; Flask სერვისის ასლების გაზრდამ შეიძლება scheduler-ის რამდენიმე ერთდროული პროცესი შექმნას და მონაცემები დუბლირებულად ჩაწეროს. წარმოებაში ამ ამოცანის ცალკე worker სერვისად გაშვება ან სხვა კონტროლირებადი scheduler-ის გამოყენება განიხილე.

## ექსპორტის ფაილები და ლოგები

`Config.EXPORT_DIR` არის პროექტის root-ის `export/` დირექტორია და startup-ზე იქმნება. Scheduler logger წერს `logs/scheduler.log`-ში, მაქსიმუმ 5 MB თითო ფაილზე და ინახავს 3 backup-ს. Compose Flask სერვისში `./logs` mount-დება.

CSV ექსპორტის endpoint ჩამოტვირთვის დასრულების შემდეგ ფაილს შლის. ფაილის სახელი მხოლოდ თარიღის დიაპაზონით იქმნება, ამიტომ ერთდროულმა ერთნაირმა მოთხოვნებმა შეიძლება ერთი და იგივე გზაზე იჩხუბოს.

## ოპერაციული და უსაფრთხოების შენიშვნები

- `populate_db`-ში სამი საწყისი Admin ანგარიში და პაროლებია ჩაწერილი. Seed-ის გაშვებამდე ეს კოდი გადაამოწმე და ანგარიშები შეცვალე.
- Weather.com API key ამჟამად `src/api/stations.py`-ში პირდაპირ არის. ახალი secret გარემოს ცვლადში გადაიტანე და არსებული გასაღების როტაცია განიხილე.
- Debug რეჟიმი და fallback secret-ები წარმოებაში გამოსაყენებელი არ არის.
- სადგურის წამოღების `requests.get()`-ს timeout არ აქვს; მიუწვდომელმა გარე API-მ scheduler-ის სამუშაო შეიძლება გააჭიანუროს.
- Scheduler-ის `RotatingFileHandler`-ს `logs/` დირექტორია სჭირდება. Dockerfile ქმნის მას; ლოკალურ გაშვებამდე დარწმუნდი, რომ დირექტორია არსებობს.
- ზოგიერთი timestamp `datetime.now()`-ით, ხოლო ისტორიული მონაცემი `+4 საათით` იქმნება. გარემოს timezone-ის ერთიანი მართვა მნიშვნელოვანია; კოდში timezone-aware დროები არ გამოიყენება.

