# On-Site PC Inventory 192.168.0.188

Generated at: 2026-05-09T18:02:41+00:00

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
tmpfs                              382M  1.4M  381M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   54G  9.5G   42G  19% /
tmpfs                              1.9G     0  1.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  134M  1.7G   8% /boot
/dev/sda1                          1.1G  6.1M  1.1G   1% /boot/efi
tmpfs                              382M  4.0K  382M   1% /run/user/1000

## Memory
               total        used        free      shared  buff/cache   available
Mem:           3.7Gi       232Mi       3.3Gi       1.0Mi       253Mi       3.3Gi
Swap:          3.7Gi          0B       3.7Gi

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
tcp   LISTEN 0      128          0.0.0.0:22        0.0.0.0:*          
tcp   LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      128             [::]:22           [::]:*          

## Running Services
  UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
  cron.service                loaded active running Regular background program processing daemon
  dbus.service                loaded active running D-Bus System Message Bus
  getty@tty1.service          loaded active running Getty on tty1
  irqbalance.service          loaded active running irqbalance daemon
  ModemManager.service        loaded active running Modem Manager
  multipathd.service          loaded active running Device-Mapper Multipath Device Controller
  networkd-dispatcher.service loaded active running Dispatcher daemon for systemd-networkd
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
22 loaded units listed.

## Docker Containers

## Docker Images

## Docker Volumes

## Project Paths
total 8
drwxr-xr-x  2 root root 4096 Sep 11  2024 .
drwxr-xr-x 20 root root 4096 May  9 08:52 ..
