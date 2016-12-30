class Streamer < ActiveRecord::Base

  belongs_to :datagram
  belongs_to :stream_sink

  before_save :set_name

  def as_json(include_root = false)
    attributes.merge(stream_sink_name: stream_sink.try(:name))
  end

  def publish!
    datagram.publish(self.param_set, self)
  end

  def archived?
    datagram.archived?
  end

  def render
    streamer.stream!
    update(response_json: streamer.message, last_run_at: DateTime.now)
  end

  def streamer
    @streamer ||= streamer_class.new(self)
  end

  def streamer_class
    Kernel.const_get("Streamer::" + stream_sink.stream_type.titleize + "Streamer") rescue Streamer::NullStreamer
  end

  def set_name
    self.name = "#{datagram.name} #{param_set} #{view_name}"
  end

  class BaseStreamer
    def initialize(streamer)
      @streamer = streamer
      @stream_sink = streamer.stream_sink
      @datagram = streamer.datagram
      @view = streamer.view_name
    end

    def message
      ps = {params: datagram.param_sets[streamer.param_set]["params"], format: streamer.format}
      ap "#Streamer #{ps}"
      @message ||= DatagramFetcherService.new(datagram, ps).render([view])
    end


    private
    attr_reader :datagram, :view, :stream_sink, :streamer

    def chartify_url(url)
      url.gsub(".png",".png?rand=#{rand(10000)}")
    end

    def stream_data
      OpenStruct.new(streamer.stream_sink.data)
    end

    def format
      "png"
    end

    def params
      datagram.param_sets[streamer.param_set]["params"]
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
          caption = "#{datagram.name} #{params.map{|k,v| "#{k}: #{v}"}.join(" , ")}"
          bot.api.sendPhoto(chat_id: stream_data.chat_id, photo: message[:url], caption: caption)
        end
      end
    end
  end

  class NullStreamer < BaseStreamer
    def stream!
    end
  end

end
