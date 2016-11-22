class WatchCreatorService

  def initialize(params, asDatagram)
    ap params
    @params = params.with_indifferent_access
    @as_datagram = asDatagram
  end

  def save
    if @watch = (Watch.find(params[:id]) rescue nil)
      ap "watch exists"
      @watch.update(params)
    else
      ap "creating watch"
      @watch = Watch.create(params)
      ap @watch.errors
      ap as_datagram
      if @watch.errors.empty? and as_datagram
        @datagram = Datagram.create(name: @watch.name, publish_params: @watch.params, watch_ids: [@watch.id])
        ap @datagram
      end
    end
    return {watch: @watch, datagram: @datagram}
  end

    attr_reader :params, :as_datagram
end
