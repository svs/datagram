require 'rails_helper'

describe HomeController do

  it "should have an index page" do
    get :index
    expect(response).to be_ok
  end

end
