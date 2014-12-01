require 'rails_helper'


describe Datagram do

  let!(:w1) { FactoryGirl.create(:watch) }
  let!(:w2) { FactoryGirl.create(:watch) }
  let!(:w3) { FactoryGirl.create(:watch) }

  let!(:datagram) { FactoryGirl.build(:datagram, watch_ids: [w1.id, w2.id ]).tap{|d| d.save} }

  it "should have a token" do
    expect(datagram.token).to be_a String
  end


  it "should have a payload" do
    expect(datagram.payload).to be_a Hash
    expect(datagram.payload.keys).to eq [:datagram_id, :watches, :routing_key, :datagram_token, :timestamp, :refresh_channel, :response_q]
    expect(datagram.payload[:datagram_id]).to eq datagram.token
    expect(datagram.payload[:watches].count).to eq 2
  end

end
