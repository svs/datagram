threads 1, 6
workers 4

daemonize true
pidfile '/home/deploy/datagram/shared/tmp/pids/puma.pid'
state_path '/home/deploy/datagram/shared/tmp/pids/puma.state'
bind 'unix:///home/deploy/datagram/shared/tmp/sockets/puma.sock'
environment 'staging'
