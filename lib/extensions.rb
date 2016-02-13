class Hash
  def deep_sort
    Hash[stringify_keys.sort.map {|k, v| [k, v.is_a?(Hash) ? v.deep_sort : v]}]
  end
end
