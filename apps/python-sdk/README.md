# Firecrawl Python SDK

The Firecrawl Python SDK is a library that lets you easily search, scrape, and interact with the web for AI agents — returning clean Markdown or structured data your agents can ship with. It provides a simple and intuitive interface for the Firecrawl API.

## Installation

To install the Firecrawl Python SDK, you can use pip:

```bash 
pip install firecrawl-py
```

## Usage

1. Get an API key from [firecrawl.dev](https://firecrawl.dev)
2. Set the API key as an environment variable named `FIRECRAWL_API_KEY` or pass it as a parameter to the `Firecrawl` class.

Here's an example of how to use the SDK:

```python 
from firecrawl import Firecrawl
from firecrawl.types import ScrapeOptions

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

# Scrape a website (v2):
data = firecrawl.scrape(
  'https://firecrawl.dev', 
  formats=['markdown', 'html']
)
print(data)

# Crawl a website (v2 waiter):
crawl_status = firecrawl.crawl(
  'https://firecrawl.dev', 
  limit=100, 
  scrape_options=ScrapeOptions(formats=['markdown', 'html'])
)
print(crawl_status)
```

### Scraping a URL

To scrape a single URL, use the `scrape` method. It takes the URL as a parameter and returns a document with the requested formats.

```python 
# Scrape a website (v2):
scrape_result = firecrawl.scrape('https://firecrawl.dev', formats=['markdown', 'html'])
print(scrape_result)
```

### Video extraction

Use the `video` format on supported video URLs, including YouTube and TikTok. The returned `video` field is a signed URL to the extracted video file.

```python
doc = firecrawl.scrape('https://www.youtube.com/watch?v=dQw4w9WgXcQ', formats=['video'])
print(doc.video)
```

### Parsing uploaded files

Use `parse` to upload local bytes/files (`html`, `pdf`, `docx`, etc.) as multipart form data and return the parsed document.
`parse` does not support change tracking or browser-only options (actions, wait_for, location, mobile, screenshot, branding, audio, video).

```python
from firecrawl import Firecrawl
from firecrawl.v2.types import ParseOptions

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

doc = firecrawl.parse(
  b"<!DOCTYPE html><html><body><h1>Python Parse</h1></body></html>",
  filename="upload.html",
  content_type="text/html",
  options=ParseOptions(formats=["markdown"]),
)

print(doc.markdown)
```

### Crawling a Website

To crawl a website, use the `crawl` method. It takes the starting URL and optional parameters as arguments. You can control depth, limits, formats, and more.

```python 
crawl_status = firecrawl.crawl(
  'https://firecrawl.dev', 
  limit=100, 
  scrape_options=ScrapeOptions(formats=['markdown', 'html']),
  poll_interval=30
)
print(crawl_status)
```

### Asynchronous Crawling

<Tip>Looking for async operations? Check out the [Async Class](#async-class) section below.</Tip>

To enqueue a crawl asynchronously, use `start_crawl`. It returns the crawl `ID` which you can use to check the status of the crawl job.

```python 
crawl_job = firecrawl.start_crawl(
  'https://firecrawl.dev', 
  limit=100, 
  scrape_options=ScrapeOptions(formats=['markdown', 'html']),
)
print(crawl_job)
```

### Checking Crawl Status

To check the status of a crawl job, use the `get_crawl_status` method. It takes the job ID as a parameter and returns the current status of the crawl job.

```python 
crawl_status = firecrawl.get_crawl_status("<crawl_id>")
print(crawl_status)
```

### Manual Pagination (v2)

Crawl and batch scrape status responses may include a `next` URL when more data is available. The SDK auto-paginates by default; to page manually, disable auto-pagination and pass the opaque `next` URL back to the SDK.

```python
from firecrawl.v2.types import PaginationConfig

# Crawl: fetch one page at a time
crawl_job = firecrawl.start_crawl("https://firecrawl.dev", limit=100)
status = firecrawl.get_crawl_status(
  crawl_job.id,
  pagination_config=PaginationConfig(auto_paginate=False),
)
if status.next:
  page2 = firecrawl.get_crawl_status_page(status.next)

# Batch scrape: fetch one page at a time
batch_job = firecrawl.start_batch_scrape(["https://firecrawl.dev"])
status = firecrawl.get_batch_scrape_status(
  batch_job.id,
  pagination_config=PaginationConfig(auto_paginate=False),
)
if status.next:
  page2 = firecrawl.get_batch_scrape_status_page(status.next)
```

### Cancelling a Crawl

To cancel an asynchronous crawl job, use the `cancel_crawl` method. It takes the job ID of the asynchronous crawl as a parameter and returns the cancellation status.

```python 
cancel_crawl = firecrawl.cancel_crawl(id)
print(cancel_crawl)
```

### Map a Website

Use `map` to generate a list of URLs from a website. Options let you customize the mapping process, including whether to use the sitemap or include subdomains.

```python 
# Map a website (v2):
map_result = firecrawl.map('https://firecrawl.dev')
print(map_result)
```

### Scrape-bound interactive browsing (v2)

Use a scrape job ID to keep interacting with the replayed browser context:

```python
doc = firecrawl.scrape(
  "https://example.com",
  actions=[{"type": "click", "selector": "a[href='/pricing']"}],
)

scrape_job_id = doc.metadata_typed.scrape_id
if not scrape_job_id:
  raise RuntimeError("Missing scrape job id")

run = firecrawl.interact(
  scrape_job_id,
  code="print(await page.url())",
  language="python",
  timeout=60,
)
print(run.stdout)

firecrawl.stop_interaction(scrape_job_id)
```

{/* ### Extracting Structured Data from Websites

  To extract structured data from websites, use the `extract` method. It takes the URLs to extract data from, a prompt, and a schema as arguments. The schema is a Pydantic model that defines the structure of the extracted data.

  <ExtractPythonShort /> */}

### Crawling a Website with WebSockets

To crawl a website with WebSockets, use the `crawl_url_and_watch` method. It takes the starting URL and optional parameters as arguments. The `params` argument allows you to specify additional options for the crawl job, such as the maximum number of pages to crawl, allowed domains, and the output format.

```python 
# inside an async function...
nest_asyncio.apply()

# Define event handlers
def on_document(detail):
    print("DOC", detail)

def on_error(detail):
    print("ERR", detail['error'])

def on_done(detail):
    print("DONE", detail['status'])

    # Function to start the crawl and watch process
async def start_crawl_and_watch():
    # Initiate the crawl job and get the watcher
    watcher = app.crawl_url_and_watch('firecrawl.dev', exclude_paths=['blog/*'], limit=5)

    # Add event listeners
    watcher.add_event_listener("document", on_document)
    watcher.add_event_listener("error", on_error)
    watcher.add_event_listener("done", on_done)

    # Start the watcher
    await watcher.connect()

# Run the event loop
await start_crawl_and_watch()
```

## Error Handling

The SDK handles errors returned by the Firecrawl API and raises appropriate exceptions. If an error occurs during a request, an exception will be raised with a descriptive error message.

```python
from firecrawl import Firecrawl
from firecrawl.v2.utils.error_handler import FirecrawlError

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")

try:
    data = firecrawl.scrape('https://example.com', formats=['markdown'])
    print(data.markdown)
except FirecrawlError as e:
    print(f"Firecrawl API error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Best Practices

### Rate Limiting

When crawling many pages, use asynchronous crawl with polling to avoid rate limits:

```python
# ✅ Good: Use async crawl for large jobs
crawl_job = firecrawl.start_crawl(
    'https://example.com',
    limit=1000,
    scrape_options=ScrapeOptions(formats=['markdown'])
)

# Poll for status
import time
while True:
    status = firecrawl.get_crawl_status(crawl_job.id)
    if status.status in ['completed', 'failed', 'cancelled']:
        break
    time.sleep(30)  # Poll every 30 seconds
```

### Timeout Configuration

Configure timeouts for slow-loading pages:

```python
# Increase timeout for slow websites
firecrawl = Firecrawl(
    api_key="fc-YOUR_API_KEY",
    timeout=120  # 120 seconds
)

# Or per-request
数据 = firecrawl.scrape(
    'https://slow-website.com',
    formats=['markdown'],
    timeout=120
)
```

### Selective Content Extraction

Use `include_tags` and `exclude_tags` to extract only relevant content:

```python
# ✅ Good: Extract only main content
数据 = firecrawl.scrape(
    'https://example.com/blog/post',
    formats=['markdown'],
    include_tags=['article', '.post-content'],
    exclude_tags=['nav', 'footer', '.ads', '.comments']
)
```

### Formats Selection

Choose formats based on your needs to minimize token usage:

```python
# ✅ Good: Only request what you need
# For LLM processing: markdown is enough
doc = firecrawl.scrape(url, formats=['markdown'])

# For data extraction: add structured JSON
from pydantic import BaseModel

class Article(BaseModel):
    title: str
    author: str
    date: str

data = firecrawl.extract(
    urls=['https://example.com/article'],
    prompt="Extract article metadata",
    schema=Article
)
```

### Error Recovery

Implement retry logic for production use:

```python
import time
from firecrawl.v2.utils.error_handler import FirecrawlError

def scrape_with_retry(url: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return firecrawl.scrape(url, formats=['markdown'])
        except FirecrawlError as e:
            if "rate_limit" in str(e).lower():
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            raise  # Re-raise non-rate-limit errors
    raise Exception(f"Failed after {max_retries} retries")
```

### Self-Hosted Instances

For self-hosted Firecrawl instances, disable API key requirement:

```python
# ✅ Good: Self-hosted instance
firecrawl = Firecrawl(
    api_url="http://localhost:3002",
    # No api_key needed for self-hosted
)

data = firecrawl.scrape('https://example.com')
```

## Common Issues & Solutions

### Issue: "API key required" error

**Solution**: Set `FIRECRAWL_API_KEY` environment variable or pass `api_key` parameter:

```bash
export FIRECRAWL_API_KEY="fc-your-key"
```

Or in code:

```python
firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")
```

### Issue: Timeout on slow websites

**Solution**: Increase timeout or use `wait_for` option:

```python
data = firecrawl.scrape(
    'https://slow-website.com',
    formats=['markdown'],
    timeout=120,
    wait_for=10000  # Wait 10s for page to load
)
```

### Issue: Missing content from JS-heavy websites

**Solution**: Enable JS rendering with `actions`:

```python
from firecrawl.v2.types import WaitAction

data = firecrawl.scrape(
    'https://spa-website.com',
    formats=['markdown'],
    actions=[WaitAction(time=5000)]  # Wait 5s for JS to render
)
```

### Issue: Too many requests timing out

**Solution**: Use batch scrape for multiple URLs:

```python
# ✅ Good: Batch scrape for multiple URLs
batch_job = firecrawl.start_batch_scrape(
    urls=['https://example1.com', 'https://example2.com', ...],
    scrape_options=ScrapeOptions(formats=['markdown'])
)

# Poll for completion
while not batch_job.is_complete():
    time.sleep(10)
    batch_job = firecrawl.get_batch_scrape_status(batch_job.id)
```

## Async Class

For async operations, you can use the `AsyncFirecrawl` class. Its methods mirror the `Firecrawl` class, but you `await` them.

```python 
from firecrawl import AsyncFirecrawl

firecrawl = AsyncFirecrawl(api_key="YOUR_API_KEY")

# Async Scrape (v2)
async def example_scrape():
  scrape_result = await firecrawl.scrape(url="https://example.com")
  print(scrape_result)

# Async Parse (v2)
async def example_parse():
  parse_result = await firecrawl.parse(
    b"<!DOCTYPE html><html><body><h1>Async Parse</h1></body></html>",
    filename="upload.html",
    content_type="text/html",
  )
  print(parse_result)

# Async Crawl (v2)
async def example_crawl():
  crawl_result = await firecrawl.crawl(url="https://example.com")
  print(crawl_result)
```

## v1 compatibility

For legacy code paths, v1 remains available under `firecrawl.v1` with the original method names.

```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="YOUR_API_KEY")

# v1 methods (feature‑frozen)
doc_v1 = firecrawl.v1.scrape_url('https://firecrawl.dev', formats=['markdown', 'html'])
crawl_v1 = firecrawl.v1.crawl_url('https://firecrawl.dev', limit=100)
map_v1 = firecrawl.v1.map_url('https://firecrawl.dev')
```
