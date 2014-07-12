require 'rails_helper'


describe WatchResponse do

  it { should validate_uniqueness_of(:token)  }

  it "should recognise previous response" do
    wr1 = FactoryGirl.build(:watch_response, timestamp: 1).tap{|wr| wr.save}
    wr2 = FactoryGirl.build(:watch_response, timestamp: 2).tap{|wr| wr.save}
    expect(wr2.previous_response).to eq(wr1)
  end

  describe "strip keys" do
    subject { FactoryGirl.build(:watch_response) }

    it "should strip keys properly" do
      subject.response_json = {:data => {:a => {:b => {:b1 => 1, :b2 => 2}, :c => [1,2,3]}}}
      subject.strip_keys = {:data => {:a => {:b => :b2}}}
      subject.save
      expect(subject.response_json[:data]).to eql ({:a => {:b => {:b1 => 1}, :c => [1,2,3]}})
    end
  end

end
