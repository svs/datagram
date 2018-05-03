require 'rails_helper'

describe ParamsRenderer do
  before do
    Timecop.freeze('2018-04-15')
  end
  it "should shift days" do
    pr = ParamsRenderer.new({a: "{{b}}", c: "{{start_date}}"}, {b: "foo", start_date: "[[-1d]]"})
    expect(pr.render).to eq({"a" => "foo", "c" => (Date.new(2018,4,14)).strftime("%Y-%m-%d")})
  end
  it "should shift weeks" do
    pr = ParamsRenderer.new({a: "{{b}}", c: "{{start_date}}"}, {b: "foo", start_date: "[[-1w]]"})
    expect(pr.render).to eq({"a" => "foo", "c" => (Date.new(2018,4,8)).strftime("%Y-%m-%d")})
  end
  it "should snap to start of week" do
    pr = ParamsRenderer.new({a: "{{b}}", c: "{{start_date}}"}, {b: "foo", start_date: "[[-1w<]]"})
    expect(pr.render).to eq({"a" => "foo", "c" => (Date.new(2018,4,2)).strftime("%Y-%m-%d")})
  end
  it "should snap to start of month" do
    pr = ParamsRenderer.new({a: "{{b}}", c: "{{start_date}}"}, {b: "foo", start_date: "[[-1m<]]"})
    expect(pr.render).to eq({"a" => "foo", "c" => (Date.new(2018,3,1)).strftime("%Y-%m-%d")})
  end
  it "should return proper format" do
    pr = ParamsRenderer.new({a: "{{b}}", c: "{{start_date}}"}, {b: "foo", start_date: "[[-1d%Y%m%d]]"})
    expect(pr.render).to eq({"a" => "foo", "c" => (Date.new(2018,4,14)).strftime("%Y%m%d")})
  end

  describe ParamsRenderer::DateMatcher do

    it "should extract simple shifts" do
      expect(ParamsRenderer::DateMatcher.new("[[-1w]]").match).to eq(direction: "-", type: "w", value: "1", snap: "", business: "", fmt: "%Y-%m-%d")
    end

    it "should extract snaps" do
      expect(ParamsRenderer::DateMatcher.new("[[-1w<+]]").match).to eq(direction: "-", type: "w", value: "1", snap: "<", business: "+", fmt: "%Y-%m-%d")
    end

    it "should extract dateformat" do
      expect(ParamsRenderer::DateMatcher.new("[[-1d%Y%m%d]]").match).to eq(direction: "-", type: "d", value: "1", snap: "", business: "", fmt: "%Y%m%d")
      expect(ParamsRenderer::DateMatcher.new("[[-1w<+%Y%m%d]]").match).to eq(direction: "-", type: "w", value: "1", snap: "<", business: "+", fmt: "%Y%m%d")
    end

    it "should fail on garbage" do
      pr = ParamsRenderer::DateMatcher.new("[[+1x]]")
      expect(pr.match).to eq(nil)
      expect(pr.direction).to eq(nil)
    end

  end


end
