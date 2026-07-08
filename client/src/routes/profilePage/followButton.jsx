import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'

const followUser = async (userName) => {
  const res = await apiRequest.post(`/users/follow/${userName}`)
  return res.data
}

function FollowButton({ isFollowing, userName }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userName] })
    }
  })

  return (
    <button
      onClick={() => mutation.mutate(userName)}
      disabled={mutation.isPending}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
        isFollowing
          ? 'border border-line bg-panel text-fog hover:bg-panel-hover'
          : 'btn-primary'
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  )
}

export default FollowButton
