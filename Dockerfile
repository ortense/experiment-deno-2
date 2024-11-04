FROM denoland/deno:alpine AS build

WORKDIR /app

COPY deno.json deno.lock ./
COPY . .

RUN deno task build 

FROM denoland/deno:alpine

WORKDIR /app

COPY --from=build /app/bin/api /app/api

EXPOSE 8000

CMD ["./api"]

