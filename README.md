# dobro-landing

Лендинг платформы «Помогать просто».

## Деплой на сервер

### 1. Клонируй репозиторий

```bash
git clone https://github.com/Etern1ty666/dobro-landing.git /var/www/fsp-frontend
```

Или если уже клонировано — обновить:

```bash
cd /var/www/fsp-frontend && git pull origin main
```

### 2. Содержимое /var/www/fsp-frontend

После клонирования там должны лежать файлы прямо в корне:

```
/var/www/fsp-frontend/
├── index.html
├── volunteers.html
├── funds.html
├── help.html
├── agreement.html
├── privacy.html
├── cookies.html
├── assets/
├── scripts/
└── styles/
```

### 3. Настрой nginx

Скопируй конфиг из корня репозитория (он хранится отдельно):

```bash
sudo cp nginx.conf /etc/nginx/sites-available/fsp-frontend
sudo ln -s /etc/nginx/sites-available/fsp-frontend /etc/nginx/sites-enabled/fsp-frontend
```

Что поменять в `nginx.conf` перед деплоем:

| Строка | Что изменить |
|--------|-------------|
| `server_name _;` | Заменить `_` на свой домен, например `server_name pomogat-prosto.ru;` |
| `root /var/www/fsp-frontend;` | Изменить путь если кладёшь файлы в другое место |

### 4. Проверь и перезапусти nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. HTTPS (опционально)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pomogat-prosto.ru
```
