require 'rails_helper'

RSpec.describe DekkoLog, :type => :model do


  it { should validate_presence_of :key }
  it { should belong_to :watch }
  it { should validate_presence_of :watch_id }

end
