class DatagramsController < ApplicationController

  def index
    @source_count = Source.count
    @watch_count = Watch.count
    render layout: 'app'
  end

end
