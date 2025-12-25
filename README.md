# Pinterest CLI Scraper

A TypeScript-based CLI tool to scrape Pinterest images and securely send them to a webhook.

## 🛠️ Installation

### 1. Clone & Install

```bash
git clone https://github.com/scandnk52/pinterest-scraper.git
cd pinterest-scraper
npm install
```

---

### 2. Configuration (.env)

Create a `.env` file in the root directory:

```env
# Pinterest Account E-Mail
EMAIL=example@mail.com

# Pinterest Account Password
PASSWORD=example123

# Webhook endpoint URL
SCRAPER_WEBHOOK_URL=https://your-webhook-instance.com/endpoint

# Secret token for header authentication
SCRAPER_WEBHOOK_TOKEN=your_secure_token_123
```

---

## 💻 Usage

### Available Commands

| Command                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `npm run start`                 | Runs the tool in development mode.                     |
| `npm run build`                 | Compiles TypeScript into JavaScript (`dist/` folder).  |
| `npm run prod -- <args>`        | Runs the compiled version. Recommended for production. |
| `npm run build:start -- <args>` | Compiles and immediately runs the tool.                |

---

### Command Syntax

```bash
npm run prod -- "<input>" [options]
```

---

### Examples

#### 1. Scrape by Search Query

Automatically searches Pinterest using the given query:

```bash
npm run prod -- "modern living room"
```

---

#### 2. Scrape by Direct URL

Scrapes a specific Pinterest board or page:

```bash
npm run prod -- "https://www.pinterest.com/username/board-name/"
```

---

## ⚙️ Options

| Flag               | Description                                  | Default |
| ------------------ | -------------------------------------------- | ------- |
| `-p, --page-count` | Number of scroll iterations on the page      | `1`     |
| `--no-headless`    | Runs the browser in visible mode (debugging) | `false` |

---

## 📦 Output

All scraped images are collected and securely sent to the configured webhook endpoint with authentication headers.

---

## ⚠️ Notes

- Make sure Chrome/Chromium is installed on your system.
- Use `--no-headless` if Pinterest blocks headless browsers.
- Respect Pinterest’s terms of service when scraping.
