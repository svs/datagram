class DgLog

  def initialize(string, context,level="info")
    @string = string
    @context = context
    @level = level
  end

  def log
    #ap log_line
    Rails.logger.send(level, log_line)
  end

  private
  attr_reader :string, :context, :level

  def self.log_line
  end

  def datagram
    if context.is_a? Binding
      d = eval("@datagram",context).try(:slug) || "                      "
    else
      context[:datagram]
    end
  end

  def watch
    if context.is_a? Binding
      eval("@watch", context).try(:slug) || "                      "
    else
      context[:watch]
    end
  end

  def user
    if context.is_a? Binding
      eval("@user", context).try(:token) || "                      "
    else
      context[:user]
    end
  end

  def ts
    if context.is_a? Binding
      eval("@timestamp", context) || "          "
    else
      context[:timestamp]
    end
  end

  def log_line
    "l/#{datagram} #{watch} #{ts} #{string}"
  end


end
