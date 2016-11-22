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
      @streamer = streamer
      @stream_data = streamer.stream_data.with_indifferent_access
      @datagram = streamer.datagram
      @views = streamer.stream_data["views"]
    end


    private
    attr_reader :datagram, :views
    def message
      @message ||= DatagramService.new(datagram, stream_data.params.merge(datagram.params_sets[ps])).render(views)
    end

    def chartify_url(url)
      url.gsub(".png",".png?rand=#{rand(10000)}")
    end

    def stream_data
      OpenStruct.new(@stream_data)
    end

    def format
      stream_data.params["format"]
    end

  end

  class SlackStreamer < BaseStreamer
    def stream!
      channel_names.each do |channel_name|
        slack.channels_create(name: channel_name) rescue nil
        slack.chat_postMessage(channel: channel_name, text: message)
      end
    end

    private

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

  end

  class TelegramStreamer < BaseStreamer
    def stream!
      Telegram::Bot::Client.run(stream_data.token) do |bot|
        if format == "png"
          bot.api.sendPhoto(chat_id: stream_data.chat_id, photo: message[:url])
        end
      end
    end

  end
end
