class Hash
  def deep_sort
    Hash[stringify_keys.sort.map {|k, v| [k, v.is_a?(Hash) ? v.deep_sort : v]}]
  end
end


module Hmac
  def hmac(key, value, digest = 'sha256')
    OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new(digest), key, value)
  end
end
