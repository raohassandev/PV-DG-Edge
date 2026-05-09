# On-Site PC Inventory 192.168.0.188

Generated at: 2026-05-09T18:17:39+00:00

## Identity
site-gatway
amx-dev
uid=1000(amx-dev) gid=1000(amx-dev) groups=1000(amx-dev),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),110(lxd)

## OS
Distributor ID:	Ubuntu
Description:	Ubuntu 22.04.5 LTS
Release:	22.04
Codename:	jammy
Linux site-gatway 5.15.0-177-generic #187-Ubuntu SMP Sat Apr 11 22:54:33 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux

## Memory
               total        used        free      shared  buff/cache   available
Mem:           3.7Gi       240Mi       3.2Gi       1.0Mi       254Mi       3.3Gi
Swap:          3.7Gi          0B       3.7Gi

## Disk
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              382M  1.4M  381M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   54G  9.5G   42G  19% /
tmpfs                              1.9G     0  1.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
/dev/sda2                          2.0G  134M  1.7G   8% /boot
/dev/sda1                          1.1G  6.1M  1.1G   1% /boot/efi
tmpfs                              382M  4.0K  382M   1% /run/user/1000

## Network
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether d8:cb:8a:02:46:3a brd ff:ff:ff:ff:ff:ff
    altname enp0s25
    inet 192.168.0.188/24 brd 192.168.0.255 scope global eno1
       valid_lft forever preferred_lft forever
    inet6 fe80::dacb:8aff:fe02:463a/64 scope link 
       valid_lft forever preferred_lft forever

## Listening Ports
Netid State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
udp   UNCONN 0      0      127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      128          0.0.0.0:22        0.0.0.0:*          
tcp   LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      128             [::]:22           [::]:*          

## Failed Systemd Units
  UNIT                                 LOAD   ACTIVE SUB    DESCRIPTION
● systemd-networkd-wait-online.service loaded failed failed Wait for Network to be Configured

LOAD   = Reflects whether the unit definition was properly loaded.
ACTIVE = The high-level unit activation state, i.e. generalization of SUB.
SUB    = The low-level unit activation state, values depend on unit type.
1 loaded units listed.

## Docker Availability

## Docker Containers

## Docker Images

## Docker Volumes

## Project Paths
total 8
drwxr-xr-x  2 root root 4096 Sep 11  2024 .
drwxr-xr-x 20 root root 4096 May  9 08:52 ..
