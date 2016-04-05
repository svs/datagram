class Streamer < ActiveRecord::Base

  belongs_to :datagram

  def render
    streamer.new(self).stream!
  end

  def streamer
    Kernel.const_get("Streamer::" + stream_sink.titleize + "Streamer")
  end


  class BaseStreamer
    def initialize(streamer)
      @stream_data = streamer.stream_data.with_indifferent_access
      @datagram = streamer.datagram
      @views = streamer.stream_data["views"]
    end

    def stream!
      ap "streaming to pusher channel #{datagram.user.token}"
      Pusher.trigger(datagram.user.token, 'stream', datagram.token)
    end

    private
    attr_reader :datagram, :stream_data, :views
    def message
      @message ||= DatagramService.new(datagram).render(views)
    end
  end

  class SlackStreamer < BaseStreamer
    def stream!
      super
      channel_names.each do |channel_name|
        slack.channels_create(name: channel_name) rescue nil
        slack.chat_postMessage(channel: channel_name, text: message)
      end
    end

    private
    def stream_data
      @stream_data["slack"].with_indifferent_access
    end

    def slack
      Slack::Web::Client.new(token: stream_data[:token])
    end

    def channel_names
      stream_data["channels"] || ["#datagrams","#dg-#{datagram.slug}"[0..20]]
    end

    def message
      super
      m = ((@message.is_a?(Hash) && chartify_url(@message[:url])) || @message) || ""
      m += "\n #{Time.now.to_i - datagram.last_update_timestamp} seconds ago"
    end


    def chartify_url(url)
      url.gsub(".png",".png?rand=#{rand(10000)}")
    end
  end

end
