require 'rails_helper'

RSpec.describe DatagramsController, :type => :controller do

  context "not logged in" do
    it "should redirect with 302" do
      get :index
      expect(response.status).to eql 302
    end
  end


  context "logged in" do

    let!(:u1) { FactoryGirl.create(:user) }

    before(:each) { sign_in u1 }

    it "should index properly" do
      get :index
      expect(response.status).to eql 200
    end
  end

end
