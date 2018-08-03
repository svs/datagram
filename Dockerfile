FROM ruby:2.4.2
MAINTAINER svs <svs@svs.io>

RUN echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list
RUN apt-get -y update
RUN apt-get install -y libpq-dev
RUN apt-get install -y --force-yes default-libmysqlclient-dev
RUN apt-get install -y libjq-dev

# install essentials
#RUN apt-get -y install build-essential
#RUN apt-get install -y --force-yes build-essential curl git
#RUN apt-get install -y --force-yes zlib1g-dev libssl-dev libreadline-dev libyaml-dev libxml2-dev libxslt-dev
#RUN apt-get clean

#RUN add-apt-repository -y ppa:chris-lea/nginx-devel
#RUN apt-get install -y -q nginx-full
#RUN apt-get install -y curl
#RUN  apt-get install -y byacc
#RUN  apt-get install -y autoconf libtool flex build-essential bison libonig2 libonig-dev


# # Install rbenv
# RUN git clone https://github.com/sstephenson/rbenv.git /usr/local/rbenv
# RUN echo '# rbenv setup' > /etc/profile.d/rbenv.sh
# RUN echo 'export RBENV_ROOT=/usr/local/rbenv' >> /etc/profile.d/rbenv.sh
# RUN echo 'export PATH="$RBENV_ROOT/bin:$PATH"' >> /etc/profile.d/rbenv.sh
# RUN echo 'eval "$(rbenv init -)"' >> /etc/profile.d/rbenv.sh
# RUN chmod +x /etc/profile.d/rbenv.sh

# # install ruby-build
# RUN mkdir /usr/local/rbenv/plugins
# RUN git clone https://github.com/sstephenson/ruby-build.git /usr/local/rbenv/plugins/ruby-build
# RUN /usr/local/rbenv/plugins/ruby-build/install.sh
# ENV RBENV_ROOT /usr/local/rbenv

# # does not work. PATH is set to
# # $RBENV_ROOT/shims:$RBENV_ROOT/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
# RUN echo $PATH
# # install ruby2
# RUN /usr/local/rbenv/bin/rbenv install 2.1.2
# ENV PATH /usr/local/rbenv/bin:/usr/local/rbenv/shims:$PATH
# RUN /usr/local/rbenv/bin/rbenv rehash
# RUN /usr/local/rbenv/bin/rbenv global 2.1.2
# RUN /usr/local/rbenv/bin/rbenv local 2.1.2



RUN gem install bundler
#RUN groupadd deploy
#RUN useradd -s /bin/bash -g deploy --home-dir /home/deploy deploy
RUN mkdir /myapp

# RUN mkdir /home/deploy/jq
# WORKDIR /home/deploy
# RUN git clone https://github.com/stedolan/jq.git
# WORKDIR /home/deploy/jq
# RUN ls

# RUN autoreconf -i
# RUN ./configure --enable-shared
# RUN make
# RUN sudo make install

# RUN sudo ldconfig

WORKDIR /myapp
#RUN mkdir datagram

#RUN /usr/local/rbenv/bin/rbenv global 2.1.2
#RUN /usr/local/rbenv/bin/rbenv local 2.1.2


#ADD Gemfile /home/deploy/datagram/Gemfile
#ADD Gemfile.lock /home/deploy/datagram/Gemfile.lock
#WORKDIR /home/deploy/datagram
COPY Gemfile ./Gemfile
COPY Gemfile.lock ./Gemfile.lock
RUN bundle install --jobs 20 --retry 5
COPY . .
#COPY ./config/database.docker /myapp/config/database.foo
#RUN apt-get -y update

#RUN ls
#ADD . /home/deploy/datagram
ENV RAILS_ENV production
ENV RACK_ENV production
RUN bundle exec rake assets:clobber && rake assets:precompile RAILS_ENV=production
RUN mv vendor/assets/theme public/assets
#RUN rm -rf /home/deploy/datagram/.git
#EXPOSE 3000
#CMD bundle exec puma -p 3000
