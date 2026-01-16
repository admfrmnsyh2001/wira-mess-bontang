# Wira Mess Bontang

## Getting Started

```sh
pnpm i
pnpm --filter directus-ext build
pnpm --filter app build
```

## Run dev

### Backend

```sh
pnpm --filter directus dev
```

```sh
pnpm --filter directus-ext dev
```

### Frontend

```sh
pnpm --filter app dev
```
## Tunneling

```
sudo socat TCP-LISTEN:443,fork TCP:192.168.122.203:443
```