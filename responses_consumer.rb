#!/usr/bin/env ruby
 require 'rubygems'
 require 'amqp'
 require 'daemons'

ENV["RAILS_ENV"] ||= "development"
require_relative './config/boot'
require_relative './config/environment'

 options = { :backtrace => true, :dir => '.', :log_output => true}

Rails.logger.info '#ResponsesConsumer connected to RMQ'

$r.subscribe(block: true) do |di, md, payload|
  ResponseHandler.new(JSON.parse(payload)).handle!
end
