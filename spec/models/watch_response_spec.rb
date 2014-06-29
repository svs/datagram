require 'rails_helper'


describe WatchResponse do

  subject { FactoryGirl.build(:watch_response) }

  it "should strip keys properly" do
    subject.response_json = {:data => {:a => {:b => {:b1 => 1, :b2 => 2}, :c => [1,2,3]}}}
    subject.strip_keys = {:a => {:b => :b2}}
    subject.save
    expect(subject.response_json[:data]).to eql ({:a => {:b => {:b1 => 1}, :c => [1,2,3]}})
  end

end
