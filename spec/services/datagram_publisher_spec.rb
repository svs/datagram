require 'rails_helper'

describe DatagramPublisher do

  before(:each) {
    WatchResponse.destroy_all
  }

  let!(:w1) { FactoryGirl.create(:watch) }
  let!(:w2) { FactoryGirl.create(:watch) }

  let!(:datagram) { FactoryGirl.build(:datagram, watch_ids: [w1.id, w2.id]) }
  let!(:publisher) { DatagramPublisher.new(datagram: datagram) }

  it "should create 2 watch responses" do
    expect { publisher.publish! }.to change(WatchResponse, :count).by(2)
  end

  it "should have a payload" do
    p1 = ap publisher.publish!
    binding.pry
    p2 = ap publisher.publish!

    ap WatchResponse.all.map(&:token)
    expect(p1).to eql p2
  end

end
