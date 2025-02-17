import { json, type DataFunctionArgs } from '@remix-run/node'
import {
	Form,
	NavLink,
	Outlet,
	useLoaderData,
	useMatches,
	useRouteError,
} from '@remix-run/react'
import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { getUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { Button } from '~/utils/forms'

export async function loader({ request, params }: DataFunctionArgs) {
	invariant(params.username, 'Missing username')
	const loggedInUserId = await getUserId(request)
	const user = await prisma.user.findUnique({
		where: { username: params.username },
	})
	if (!user) {
		throw new Response('not found', { status: 404 })
	}

	return json({
		isSelf: user.id === loggedInUserId,
	})
}

export default function UserRoute() {
	const data = useLoaderData<typeof loader>()
	const matches = useMatches()
	const lastMatch = matches[matches.length - 1]
	const onIndexPage = lastMatch.id.endsWith('index')

	return (
		<div className="mt-36 mb-48">
			{onIndexPage ? null : (
				<div className="container mx-auto flex justify-end">
					<div className="flex justify-between gap-6">
						{data.isSelf ? (
							<Form action="/logout" method="post">
								<Button type="submit" size="pill" variant="secondary">
									Logout
								</Button>
							</Form>
						) : null}
						<div className="flex justify-between rounded-full border border-night-400 bg-night-700">
							<NavLink
								preventScrollReset
								prefetch="intent"
								to="host"
								className={({ isActive }) =>
									clsx('rounded-full py-3 px-12 leading-3', {
										'bg-night-700 text-white': !isActive,
										'bg-white text-black': isActive,
									})
								}
							>
								Host
							</NavLink>
							<NavLink
								preventScrollReset
								prefetch="intent"
								to="renter"
								className={({ isActive }) =>
									clsx('rounded-full py-3 px-12 leading-3', {
										'bg-night-700 text-white': !isActive,
										' bg-white text-black': isActive,
									})
								}
							>
								Renter
							</NavLink>
						</div>
					</div>
				</div>
			)}
			<Outlet />
		</div>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	// 🐨 get the params so we can display the username that is causing the error
	console.error(error)

	// 🐨 create the error message that will be displayed to the user
	// you can default it to the existing error message we have below.

	// 🐨 if the error is a 404 Response error, then display a different message
	// that explains no user by the username given was found.

	return (
		<div className="container mx-auto flex items-center justify-center p-20 text-h2 text-accent-red">
			{/* 🐨 display the error message here */}
			<p>Oh no, something went wrong. Sorry about that.</p>
		</div>
	)
}
