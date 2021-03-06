class DgLog

  def initialize(string, context,level="info")
    @string = string
    @context = context.is_a?(Hash) ? context.symbolize_keys : context
    @level = level
  end

  def log
    #ap log_line
    Rails.logger.send(level, log_line)
    if channel
      Pusher.trigger(channel, 'log', {ts: ts, log: pusher_log_line})
    end
  end

  private
  attr_reader :string, :context, :level

  def self.log_line
  end

  def datagram
    return @datagram if @datagram
    if context.is_a? Binding
      @datagram = eval("@datagram",context).try(:slug) || "                      "
    else
      @datagram = context[:datagram]
    end
  end

  def watch
    return @watch || (@watch =
                      if context.is_a? Binding
                        eval("@watch", context).try(:slug) || "                      "
                      else
                        context[:watch]
                      end)
  end

  def user
    return @user || (@user =
                     if context.is_a? Binding
                       eval("@user", context).try(:token) || "                      "
                     else
                       context[:user]
                     end
                    )
  end

  def ts
    return @ts || (@ts =
                   if context.is_a? Binding
                     eval("@timestamp", context) || "          "
                   else
                     context[:timestamp]
                   end
                  )
  end

  def channel
    return @channel || (@channel =
                        if context.is_a? Binding
                          eval("@channel", context) || nil
                        else
                          context[:channel]
                        end
                       )
  end

  def log_line
    "l/#{datagram} #{watch} #{ts} #{string}"
  end


  def pusher_log_line
    as = log_line.split("#")
    as[0].split(" ") + [as[1]]
  end
end
