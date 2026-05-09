# On-Site PC Inventory 192.168.0.188

Generated at: 2026-05-09T18:41:17+00:00

## OS and Host
 Static hostname: site-gatway
       Icon name: computer-desktop
         Chassis: desktop
      Machine ID: 0a577fe5588a4ae882f7d15739d002f7
         Boot ID: 2f16402496ed4fdcb1bfc26d7acf4615
Operating System: Ubuntu 22.04.5 LTS
          Kernel: Linux 5.15.0-177-generic
    Architecture: x86-64
 Hardware Vendor: Lenovo
  Hardware Model: ThinkCentre M73
Linux site-gatway 5.15.0-177-generic #187-Ubuntu SMP Sat Apr 11 22:54:33 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux

## Disk
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              382M  2.2M  380M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   54G   14G   37G  27% /
tmpfs                              1.9G     0  1.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  134M  1.7G   8% /boot
/dev/sda1                          1.1G  6.1M  1.1G   1% /boot/efi
tmpfs                              382M  4.0K  382M   1% /run/user/1000

## Memory
               total        used        free      shared  buff/cache   available
Mem:           3.7Gi       654Mi       577Mi        49Mi       2.5Gi       2.8Gi
Swap:          3.7Gi       1.0Mi       3.7Gi

## Users
root:0:/root
daemon:1:/usr/sbin
bin:2:/bin
sys:3:/dev
sync:4:/bin
games:5:/usr/games
man:6:/var/cache/man
lp:7:/var/spool/lpd
mail:8:/var/mail
news:9:/var/spool/news
uucp:10:/var/spool/uucp
proxy:13:/bin
www-data:33:/var/www
backup:34:/var/backups
list:38:/var/list
irc:39:/run/ircd
gnats:41:/var/lib/gnats
nobody:65534:/nonexistent
_apt:100:/nonexistent
systemd-network:101:/run/systemd
systemd-resolve:102:/run/systemd
messagebus:103:/nonexistent
systemd-timesync:104:/run/systemd
pollinate:105:/var/cache/pollinate
syslog:106:/home/syslog
uuidd:107:/run/uuidd
tcpdump:108:/nonexistent
tss:109:/var/lib/tpm
landscape:110:/var/lib/landscape
fwupd-refresh:111:/run/systemd
usbmux:112:/var/lib/usbmux
sshd:113:/run/sshd
amx-dev:1000:/home/amx-dev
lxd:999:/var/snap/lxd/common/lxd

## Listening Ports
Netid State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
udp   UNCONN 0      0      127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      4096         0.0.0.0:80        0.0.0.0:*          
tcp   LISTEN 0      128          0.0.0.0:22        0.0.0.0:*          
tcp   LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      4096         0.0.0.0:1883      0.0.0.0:*          
tcp   LISTEN 0      4096            [::]:80           [::]:*          
tcp   LISTEN 0      128             [::]:22           [::]:*          
tcp   LISTEN 0      4096            [::]:1883         [::]:*          

## Services
  UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
  containerd.service          loaded active running containerd container runtime
  cron.service                loaded active running Regular background program processing daemon
  dbus.service                loaded active running D-Bus System Message Bus
  docker.service              loaded active running Docker Application Container Engine
  getty@tty1.service          loaded active running Getty on tty1
  irqbalance.service          loaded active running irqbalance daemon
  ModemManager.service        loaded active running Modem Manager
  multipathd.service          loaded active running Device-Mapper Multipath Device Controller
  networkd-dispatcher.service loaded active running Dispatcher daemon for systemd-networkd
  packagekit.service          loaded active running PackageKit Daemon
  polkit.service              loaded active running Authorization Manager
  rsyslog.service             loaded active running System Logging Service
  snapd.service               loaded active running Snap Daemon
  ssh.service                 loaded active running OpenBSD Secure Shell server
  systemd-hostnamed.service   loaded active running Hostname Service
  systemd-journald.service    loaded active running Journal Service
  systemd-logind.service      loaded active running User Login Management
  systemd-networkd.service    loaded active running Network Configuration
  systemd-resolved.service    loaded active running Network Name Resolution
  systemd-timesyncd.service   loaded active running Network Time Synchronization
  systemd-udevd.service       loaded active running Rule-based Manager for Device Events and Files
  thermald.service            loaded active running Thermal Daemon Service
  udisks2.service             loaded active running Disk Manager
  unattended-upgrades.service loaded active running Unattended Upgrades Shutdown
  user@1000.service           loaded active running User Manager for UID 1000

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state, i.e. generalization of SUB.
SUB    = The low-level unit activation state, values depend on unit type.
25 loaded units listed.

## Docker Containers
CONTAINER ID   IMAGE                               COMMAND                  CREATED          STATUS                    PORTS                                         NAMES
ce99d3c42096   deploy-api                          "docker-entrypoint.s…"   50 seconds ago   Up 48 seconds (healthy)   3000/tcp                                      deploy-api-1
fc2ac3ab185d   deploy-aggregation-worker           "docker-entrypoint.s…"   50 seconds ago   Up 48 seconds                                                           deploy-aggregation-worker-1
91d807f55365   deploy-acquisition-worker           "docker-entrypoint.s…"   50 seconds ago   Up 48 seconds                                                           deploy-acquisition-worker-1
9ba54b443ba4   deploy-rules-worker                 "docker-entrypoint.s…"   50 seconds ago   Up 48 seconds                                                           deploy-rules-worker-1
2c525e6d0a04   deploy-web                          "/docker-entrypoint.…"   50 seconds ago   Up 48 seconds             80/tcp                                        deploy-web-1
4f2b13a28681   nginx:1.27-alpine                   "/docker-entrypoint.…"   3 minutes ago    Up 42 seconds             0.0.0.0:80->80/tcp, [::]:80->80/tcp           deploy-nginx-1
515b383fdaee   timescale/timescaledb:latest-pg16   "docker-entrypoint.s…"   3 minutes ago    Up 3 minutes (healthy)    5432/tcp                                      deploy-postgres-1
a15b33b7ff95   redis:7-alpine                      "docker-entrypoint.s…"   3 minutes ago    Up 3 minutes (healthy)    6379/tcp                                      deploy-redis-1
a384fd581db9   eclipse-mosquitto:2                 "/docker-entrypoint.…"   3 minutes ago    Up 3 minutes              0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp   deploy-mosquitto-1

## Docker Images
IMAGE                               ID             DISK USAGE   CONTENT SIZE   EXTRA
deploy-acquisition-worker:latest    55d63cbd56d0        433MB         95.5MB   U    
deploy-aggregation-worker:latest    6e5e4456115e        433MB         95.5MB   U    
deploy-api:latest                   769f33deedfa        453MB         97.4MB   U    
deploy-rules-worker:latest          c4e3f775e474        433MB         95.5MB   U    
deploy-web:latest                   91a43f095e4d       73.9MB           21MB   U    
eclipse-mosquitto:2                 a908c65cc8e6       35.9MB         10.7MB   U    
nginx:1.27-alpine                   65645c7bb6a0       74.5MB         21.9MB   U    
redis:7-alpine                      6ab0b6e73817       57.8MB         16.8MB   U    
timescale/timescaledb:latest-pg16   15e00162766b       1.75GB          439MB   U    

## Docker Volumes
DRIVER    VOLUME NAME
local     deploy_pvdg_mosquitto_data
local     deploy_pvdg_mosquitto_log
local     deploy_pvdg_postgres_data
local     deploy_pvdg_redis_data

## Project Paths
total 16
drwxr-xr-x  4 root    root    4096 May  9 18:23 .
drwxr-xr-x 20 root    root    4096 May  9 08:52 ..
drwx--x--x  4 root    root    4096 May  9 18:23 containerd
drwxr-xr-x  6 amx-dev amx-dev 4096 May  9 18:22 pvdg-edge-local
total 24
drwxr-xr-x  6 amx-dev amx-dev 4096 May  9 18:22 .
drwxr-xr-x  4 root    root    4096 May  9 18:23 ..
drwxr-xr-x 14 amx-dev amx-dev 4096 May  9 18:32 app
drwxr-xr-x  2 amx-dev amx-dev 4096 May  9 18:22 backups
drwxr-xr-x  2 amx-dev amx-dev 4096 May  9 18:22 data
drwxr-xr-x  2 amx-dev amx-dev 4096 May  9 18:22 logs
total 216
drwxr-xr-x 14 amx-dev amx-dev   4096 May  9 18:32 .
drwxr-xr-x  6 amx-dev amx-dev   4096 May  9 18:22 ..
drwxrwxr-x  7 amx-dev amx-dev   4096 May  9 18:22 apps
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 .codex
-rw-rw-r--  1 amx-dev amx-dev   1169 May  9 18:22 CODEx_START_HERE.md
drwxrwxr-x  4 amx-dev amx-dev   4096 May  9 18:22 database
drwxrwxr-x  5 amx-dev amx-dev   4096 May  9 18:40 deploy
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 diagrams
drwxrwxr-x  5 amx-dev amx-dev   4096 May  9 18:22 docs
-rw-------  1 amx-dev amx-dev    451 May  9 18:29 .env
-rw-------  1 amx-dev amx-dev    404 May  9 18:27 .env.broken.20260509_182755
-rw-rw-r--  1 amx-dev amx-dev    379 May  9 18:32 .env.example
-rw-rw-r--  1 amx-dev amx-dev    491 May  9 18:22 eslint.config.js
drwxrwxr-x  8 amx-dev amx-dev   4096 May  9 18:40 .git
-rw-rw-r--  1 amx-dev amx-dev    141 May  9 18:22 .gitignore
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 mqtt
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 openapi
-rw-rw-r--  1 amx-dev amx-dev   1251 May  9 18:22 package.json
drwxrwxr-x  8 amx-dev amx-dev   4096 May  9 18:22 packages
-rw-rw-r--  1 amx-dev amx-dev 112456 May  9 18:22 pnpm-lock.yaml
-rw-rw-r--  1 amx-dev amx-dev     40 May  9 18:22 pnpm-workspace.yaml
-rw-rw-r--  1 amx-dev amx-dev   1270 May  9 18:22 README.md
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 schemas
drwxrwxr-x  2 amx-dev amx-dev   4096 May  9 18:22 templates
-rw-rw-r--  1 amx-dev amx-dev    335 May  9 18:22 tsconfig.base.json
-rw-rw-r--  1 amx-dev amx-dev    429 May  9 18:22 tsconfig.json
-rw-rw-r--  1 amx-dev amx-dev    591 May  9 18:22 vitest.config.ts
