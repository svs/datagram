require 'rails_helper'


describe Datagram do

  let!(:w1) { FactoryGirl.create(:watch) }
  let!(:w2) { FactoryGirl.create(:watch) }
  let!(:w3) { FactoryGirl.create(:watch) }

  let!(:datagram) { FactoryGirl.create(:datagram, watch_ids: [w1.id, w2.id ]) }

  it "should have a payload" do
    expect(datagram.payload).to be_a Hash
  end

end
