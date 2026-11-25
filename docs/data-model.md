# მონაცემთა მოდელი

მოდელები განსაზღვრულია `src/models/`-ში. ძირითადი ცხრილებია `stations`, `div_positions`, `weather_data`, `prev_precip`, `users` და `roles`.

## სადგური — `stations`

`Stations` ინახავს სადგურის ძირითად იდენტობას:

- `id` — შიდა რიცხვითი ID.
- `station_name` — ეკრანზე საჩვენებელი სახელი.
- `url` — Weather Underground-ის სადგურის გვერდი.
- `api` — მიმდინარე დაკვირვების API URL.
- `latitude`, `longitude` — კოორდინატები.
- `map_status` — სადგურის რუკაზე ჩვენების სტატუსი.
- `fetch_status` — scheduler-მა უნდა წამოიღოს თუ არა ამ სადგურის მონაცემები.

სადგური უკავშირდება `WeatherData`, `PrevPrecip` და `DivPositions` ჩანაწერებს. `DivPositions`-თან ORM cascade არის დაყენებული; სადგურის წაშლის API-ს კი დამატებით საკუთარი ლოგიკა აქვს.

## რუკის განლაგება და მიმდინარე მნიშვნელობები — `div_positions`

`DivPositions` სადგურს უკავშირდება `station_id`-ით და ერთ ჩანაწერში აერთიანებს frontend-ის ვიზუალურ განლაგებასა და მიმდინარე მონაცემებს:

- განლაგება: `static_px`, `left_right`, `top_bottom`, `line_rotate`, `line_left_right`, `line_top_bottom`, `first_div_height`.
- რუკის ჯგუფი/არჩევა: `map_selected`.
- მოკლე იდენტიფიკატორი: `shorten_station_name`.
- მიმდინარე მნიშვნელობები: `precip_rate`, `precip_accum`, `precip_accum_long`.

რუკის API-სთვის ეს ველები `PRECIP_RATE`, `PRECIP_ACCUM`, `PRECIP_ACCUM_LONG` და სხვა frontend სახელებით სერიალიზდება.

## ისტორიული მონაცემები — `weather_data`

`WeatherData`-ში თითოეული ჩანაწერი აღწერს სადგურის კონკრეტულ გაზომვის დროს:

- `station_id` — სადგური.
- `precip_rate` — ნალექის მიმდინარე ინტენსივობა.
- `precip_accum` — მიმდინარე დაგროვილი მნიშვნელობა.
- `precip_accum_long` — გრძელვადიანი დაგროვება.
- `precip_time` — გაზომვის/ჩაწერის დრო.

მნიშვნელობები შენახულია ტექსტურ სვეტებში, მიუხედავად იმისა, რომ რიცხვით მნიშვნელობებს წარმოადგენენ. `precip_time`-ს მოდელში აქვს `datetime.now()`-ის ნაგულისხმევი მნიშვნელობა; scheduler-ის ისტორიული ჩაწერა კი დროს ცალსახად აწვდის `datetime.now() + 4 საათით`.

## გამოთვლის მდგომარეობა — `prev_precip`

`PrevPrecip` თითო სადგურისთვის გრძელი დაგროვების ალგორითმის შუალედურ მდგომარეობას ინახავს:

- `prev_pa` — წინა მიმდინარე დაგროვება.
- `last_pa_long` — ბოლო დაგროვილი გრძელი მნიშვნელობა, რომელიც მრიცხველის განულებისას გამოიყენება.
- `zero_start_time` — როდის დაიწყო ნულოვანი პერიოდი.

## ანგარიშები და როლები — `users`, `roles`

`User` შეიცავს UUID-ს, უნიკალურ ელფოსტას, ჰეშირებულ პაროლს და `role_id`-ს. პაროლის setter Werkzeug-ის `generate_password_hash`-ს იყენებს. `Role` შეიცავს სახელსა და `is_admin` boolean-ს; `User.check_permission()` ადმინისტრატორის უფლებას როლიდან კითხულობს.

## კავშირების შეჯამება

```text
Stations 1 ── * DivPositions
Stations 1 ── * WeatherData
Stations 1 ── * PrevPrecip
Role     1 ── * User
```

მოდელების პირდაპირი განსაზღვრებები: [stations.py](../src/models/stations.py), [weather.py](../src/models/weather.py), [users.py](../src/models/users.py).

