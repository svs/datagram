# This is the starting point for any retrieval of Datagrams
# Simply splits up the params into
#   query_params -> params the help find the correct WatchResponse
#   search_params -> additional filters for as_of, staleness, etc.
#   format -> the desired return format

# Fetches the rendered view of the datagram
class DatagramFetcherService

  # datagram -> the datagram to fetch
  # params -> params as found in the controller
  def initialize(datagram, params = nil)
    @datagram = datagram
    @params = (params || {}).with_indifferent_access
    @max_size = (params && params[:max_size]) ? params[:max_size].to_i : Float::INFINITY
  end

  def render(views = [])
    DatagramRenderService.new(self).render(Array(views)).tap{|r|
      if r.is_a?(Hash) && r[:url] && is_default?
        datagram.update(default_view_url: r[:url])
      end
    }
  end


  #private
  attr_reader :datagram, :views, :max_size
  def params
    p = @params[:params]
    r = if p.is_a? String
          datagram.param_sets[p]["params"]
        elsif p.blank?
          datagram.param_sets["__default"]["params"]
        elsif p.is_a?(Hash)
          p
        end
    DatagramFetcherService::Params.new(@params.merge({params: r}))
  end

  def response_json
    {
      responses: Hash[response_data.map{|r| [r[:slug].gsub("-","_"), r]}],
      refresh_channel: refresh_channel
    }
  end

  def watch_responses
    @watch_responses ||= DatagramResponseFinder.new(datagram, params, max_size).response
  end

  def response_data
    @response_data ||= watch_responses.map{|r|
      {
        slug: r.watch.slug,
        name: r.watch.name,
        data: (r.bytesize.to_i < max_size ? r.response_json : r.truncated_json),
        errors: r.error,
        warnings: r.bytesize.to_i < max_size ? nil : {bytesize: r.bytesize, max_size: max_size, status: 'TRUNCATED DATA'},
        metadata: r.metadata.merge(now: Time.zone.now),
        params: r.params
      }
    }
  end

  def refresh_channel
    @refresh_channel ||= datagram.refresh_channel(params.q_params)
  end

  def raw_json
    if params.refresh? && response_json[:responses].blank?
      if params.sync?
        $redis.setex(refresh_channel, 10, 0)
      end
      datagram.publish(params.q_params || {})
      if params.sync?
        done = false
        while (!done) do
          t = Time.now
          v = $redis.get(refresh_channel)
          if v == nil
            Rails.logger.info "#DatagramController TIMEOUT #{refresh_channel}"
          end
          done = v != "0"
          sleep 0.2
        end
        reset!
      end
    end
    response_json
  end

  def reset!
    @watch_responses = @response_data = nil
  end


  def is_default?
    (params.query_params.stringify_keys == (datagram.param_sets["__default"]["params"] || {}).stringify_keys).tap{|q|
    }
  end

  def q_params
    params.q_params
  end

  class Params
    # - splits controller params hash into query_params, search_params and format
    # - symbolizes keys for easy access
    # - provides convenience methods to check sync?, etc.
    def initialize(params = nil)
      @params = params
    end

    def query_params
      (params.slice(*POSSIBLE_QUERY_KEYS).values[0] || {}).symbolize_keys
    end

    def format
      params[:format] || :json
    end

    def search_params
      params.except(:controller, :format, :id,*POSSIBLE_QUERY_KEYS).symbolize_keys
    end

    def sync?
      params[:sync] != "false"
    end

    def staleness
      Integer(params[:refresh]) rescue nil
    end

    def inspect
      {q_params: q_params, search_params: search_params}
    end

    def refresh?
      search_params[:refresh]
    end

    alias :q_params :query_params
    private
    attr_reader :params



    POSSIBLE_QUERY_KEYS = [:params, :p, :q_params]
  end


end
