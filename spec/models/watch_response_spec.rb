require 'rails_helper'


describe WatchResponse do

  it { should validate_uniqueness_of(:token)  }

  it "should recognise previous response and modifications" do
    wr1 = FactoryGirl.build(:watch_response, timestamp: 1, response_json: {a: 1}, status_code: 200).tap{|wr| wr.save}
    expect(wr1.signature).to_not be_nil
    wr2 = FactoryGirl.build(:watch_response, timestamp: 2, response_json: {a: 1}, status_code: 200).tap{|wr| wr.save}
    expect(wr2.previous_response).to eq(wr1)
    expect(wr2).to_not be_modified
    wr3 = FactoryGirl.build(:watch_response, timestamp: 3, response_json: {a: 2}, status_code: 200).tap{|wr| wr.save}
    expect(wr3).to be_modified
    wr4 = FactoryGirl.build(:watch_response, timestamp: 2, response_json: {a: 2}, status_code: 100).tap{|wr| wr.save}
    expect(wr4).to be_modified
  end


  describe "strip keys" do
    subject { FactoryGirl.build(:watch_response) }

    it "should strip keys properly" do
      subject.response_json = {:data => {:a => {:b => {:b1 => 1, :b2 => 2, :b3 => { :b4 => 'c'} }, :c => [1,2,3]}}}
      subject.strip_keys = {:data => {:a => {:b => {:b2 => true, :b3 => :b4}}}}
      subject.save

      expect(subject.response_json[:data]).to eql ({:a => {:b => {:b1 => 1}, :c => [1,2,3]}})
    end
  end

end
