require 'rails_helper'


describe Datagram do

  let!(:w1) { FactoryGirl.create(:watch) }
  let!(:w2) { FactoryGirl.create(:watch) }
  let!(:w3) { FactoryGirl.create(:watch) }

  let!(:datagram) { FactoryGirl.build(:datagram, watch_ids: [w1.id, w2.id ]).tap{|d| d.save} }

  it "should have a token" do
    expect(datagram.token).to be_a String
  end



end
