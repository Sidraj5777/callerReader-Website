# Website deployment: build once, deploy static files

The website is built into plain HTML/CSS/JS files (`./out`) on your machine
and Nginx serves them. The server no longer needs the source code,
`node_modules`, `package.json` or a running Node.js process.

    your machine                         server
    ------------                         ------
    npm run build:uat  ->  out/  ->  tar.gz  ->  /opt/recall-radar/website/releases/<release>/
                                                 /opt/recall-radar/website/current  -> live release (symlink)
                                                 Nginx serves "current"

## Every deployment

    export DEPLOY_HOST=root@<server-ip>        # once per terminal
    ./deploy/deploy-website.sh uat             # or: prod (asks for confirmation)

The script stops with an error if the build points at the wrong API, and at
the end checks https://<site>/release.txt to confirm the new release is live.

Undo a bad deploy (seconds, no rebuild):

    ./deploy/rollback-website.sh --list
    ./deploy/rollback-website.sh               # back to the previous release

## One-time server switch (old Node.js service -> static files)

1. SSH key login from your machine (scripts never use passwords):

       ssh-copy-id root@<server-ip>

2. First static deploy (the old site keeps running meanwhile):

       ./deploy/deploy-website.sh uat
       # it warns that the public check failed - expected, Nginx still points at port 3000

3. Back up and replace the Nginx config on the server:

       cp /etc/nginx/sites-available/website.conf /root/website.conf.bak
       # copy deploy/nginx/website.conf there, keeping YOUR ssl_certificate paths
       nginx -t && systemctl reload nginx

4. Check in the browser: home, /about, /subscribe, /form, /privacy, /terms,
   a wrong URL (should show the 404 page), and https://testrecallradar.com/release.txt

5. Stop the old Node.js website service:

       systemctl disable --now recall-radar-website
       # port 3000 is now free

   To go back: restore /root/website.conf.bak, reload Nginx, `systemctl enable --now recall-radar-website`.

## Notes
- NEXT_PUBLIC_* values are baked into the files at build time. To change the
  API URL, edit `.env.uat` / `.env.production` and deploy again.
- `/_next/static/*` is cached for a year (file names change on every build);
  HTML is revalidated on every visit, so no Cloudflare cache purge is needed.
- `npm run dev` works exactly as before for local development.
