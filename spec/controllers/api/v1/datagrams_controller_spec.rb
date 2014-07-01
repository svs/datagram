require 'rails_helper'


describe Api::V1::DatagramsController do

  let!(:user1) { FactoryGirl.create(:user) }
  let!(:user2) { FactoryGirl.create(:user) }
  let!(:u1_d1) { FactoryGirl.create(:datagram, user_id: user1.id) }
  let!(:u2_d1) { FactoryGirl.create(:datagram, user_id: user2.id) }

  context 'unauthorised user' do
    describe 'index' do
      it "should be unauthorised" do
        get :index, format: :json
        expect(response.status).to eql 401
      end
    end
  end


  context 'authorised user' do
    before(:each) {
      sign_in user1
    }
    it "can index" do
      get :index, format: :json
      expect(response.status).to eql 200
      expect(response.body).to eql [u1_d1].to_json
    end

    it "can create a datagram" do
      d = FactoryGirl.build(:datagram, user_id: user1.id)
      expect { post :create, datagram: d.attributes }.to change(Datagram, :count).by(1)
    end

    it "shows only the users datagrams" do
      get :show, {id: u1_d1.id}
      expect(response.status).to eql 200
      get :show, {id: u2_d1.id}
      expect(response.status).to eql 404
    end
  end

end
