/*
 * View Shortlist
 * ViewShortlistPage → ViewShortlistController.getShortlist(accountId) → Shortlist, Project
 * Cards show image, project name and designer. Clicking a card opens View IDP.
 */
class ViewShortlistController {
  getShortlist(accountId) {
    const items = Shortlist.findByAccountId(accountId).map(s => s.toCard());
    if (!items.length) {
      return Result.fail('Your shortlist is empty. Browse projects to add some!', {}, { items: [] });
    }
    return Result.ok('', { items });
  }
}
