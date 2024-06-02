## Introduction

Implements a simple API to move a business through a workflow.

## Usage

### Adding a business

```bash
POST http://localhost:3300/businesses
{
    "type": "ADD",
    "payload": {
        "name": "business-name",
        "fein": "123456789"
    }
}

{
    "business": {
        "state": "NEW",
        "name": "business-name",
        "fein": "123456789"
    },
    "nextStep": {
        "type": "APPROVE_FOR_MARKET",
        "payload": [
            "industry"
        ]
    }
}
```

### Moving the business to market

```bash
POST http://localhost:3300/businesses/123456789
{
    "type": "APPROVE_FOR_MARKET",
    "payload": {
        "industry": "restaurants"
    }
}

{
    "business": {
        "state": "MARKET_APPROVED",
        "name": "business-name",
        "fein": "123456789",
        "industry": "restaurants"
    },
    "nextStep": {
        "type": "APPROVE_FOR_SALES",
        "payload": [
            "name",
            "phone"
        ]
    }
}
```

### Moving the business to sales

```bash
POST http://localhost:3300/businesses/123456789
{
    "type": "APPROVE_FOR_SALES",
    "payload": {
        "name": "contact-name",
        "phone": "123"
    }
}

{
    "business": {
        "state": "SALES_APPROVED",
        "name": "business-name",
        "fein": "123456789",
        "industry": "restaurants",
        "contact": {
            "name": "contact-name",
            "phone": "123"
        }
    },
    "nextStep": {
        "type": "DEAL_CLOSED",
        "payload": [
            "won"
        ]
    }
}
```

### Moving the business to deal closed

```bash
POST http://localhost:3300/businesses/123456789
{
    "type": "DEAL_CLOSED",
    "payload": {
        "won": true
    }
}

{
    "business": {
        "state": "DEAL_WON",
        "name": "business-name",
        "fein": "123456789",
        "industry": "restaurants",
        "contact": {
            "name": "contact-name",
            "phone": "123"
        }
    }
}
```

## Development Scripts

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Run Tests

```bash
npm run test
```
