
function comment(parent, {content}, ctx, info) {
    const userId = getUserId(ctx)
    return ctx.db.mutation.createComment(
        {data: {content, postedBy: {connect: {id: userId}}}},
    )
}