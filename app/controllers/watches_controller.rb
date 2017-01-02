class WatchesController < ApplicationController

  def index
    @watches = policy_scope(Watch)
    render layout: 'app'
  end

  def new
    render
  end
end
