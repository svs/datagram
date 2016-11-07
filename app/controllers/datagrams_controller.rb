class DatagramsController < ApplicationController

  def index
    render layout: 'material'
  end


  def new
    render 'wizard', layout: 'material'
  end


end
